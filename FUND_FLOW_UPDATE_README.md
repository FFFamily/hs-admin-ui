# 走款管理模块更新说明

## 更新概述

根据您提供的实体类字段信息，对走款管理模块进行了字段命名的统一和修正。

## 主要更新内容

### 1. 前端字段命名更新

#### 批量走款页面 (BatchFundflow.vue) 字段映射：

| 原字段名 | 新字段名 | 说明 |
|---------|---------|------|
| `plannedFundflowTime` | `planPayTime` | 计划走款时间 |
| `plannedFundflowAmount` | `fundFlowAmount` | 走款金额 |
| `plannedLoanAmount` | `loanAmount` | 贷款走款金额 |
| `plannedCapitalPoolAmount` | `fundPoolAmount` | 资金池走款金额 |
| `fundflowBank` | `loanBank` | 贷款走款银行 |
| `capitalPoolRemaining` | `contractFundPoolBalance` | 合同资金池剩余金额 |

#### 表格列标题更新：
- "本次计划走款时间" → "计划走款时间"
- "本次计划走款金额" → "走款金额"
- "计划贷款走款" → "贷款走款金额"
- "计划资金池走款" → "资金池走款金额"
- "走款银行" → "贷款走款银行"
- "资金池剩余" → "合同资金池剩余金额"

### 2. 后端实体类更新

#### FundFlow.java 主要变更：
- 主键ID类型：`Long` → `String`，使用 `IdType.ASSIGN_ID`
- 时间字段类型：`LocalDateTime` → `Date`
- 字段命名与前端保持一致

#### 关键字段说明：
```java
// 主键ID
@TableId(value = "id", type = IdType.ASSIGN_ID)
private String id;

// 走款相关字段
private BigDecimal fundFlowAmount;        // 走款金额
private BigDecimal loanAmount;           // 贷款走款金额
private BigDecimal fundPoolAmount;       // 资金池走款金额
private String loanBank;                 // 贷款走款银行
private Date planPayTime;                // 计划走款时间
private BigDecimal contractFundPoolBalance; // 合同资金池剩余金额
```

### 3. 数据库表结构更新

#### fund_flow.sql 主要变更：
- 主键字段：`bigint(20) AUTO_INCREMENT` → `varchar(32)`
- 字段命名与实体类保持一致

## 业务逻辑更新

### 1. 金额计算逻辑
```javascript
// 走款金额 = 贷款走款金额 + 资金池走款金额
fundFlowAmount = loanAmount + fundPoolAmount
```

### 2. 验证规则
- 必填字段：`planPayTime`、`fundFlowAmount`、`loanBank`
- 金额验证：走款金额必须等于贷款走款金额加资金池走款金额
- 金额限制：贷款走款金额和资金池走款金额不能超过总走款金额

### 3. 数据初始化
```javascript
// 初始化走款数据
{
  planPayTime: '',           // 计划走款时间
  fundFlowAmount: 0,         // 走款金额
  loanAmount: 0,            // 贷款走款金额
  fundPoolAmount: 0,        // 资金池走款金额
  loanBank: '',             // 贷款走款银行
  contractFundPoolBalance: 0 // 合同资金池剩余金额
}
```

## 使用示例

### 1. 前端数据绑定
```vue
<el-input-number
  v-model="scope.row.fundFlowAmount"
  :min="0"
  :precision="2"
  @change="onAmountChange(scope.row)"
/>

<el-date-picker
  v-model="scope.row.planPayTime"
  type="datetime"
  format="yyyy-MM-dd HH:mm:ss"
  value-format="yyyy-MM-dd HH:mm:ss"
/>
```

### 2. 后端API调用
```javascript
// 批量保存走款数据
const batchData = this.fundflowList.map(row => ({
  orderId: row.orderId,
  orderNo: row.orderNo,
  planPayTime: row.planPayTime,
  fundFlowAmount: row.fundFlowAmount,
  loanAmount: row.loanAmount,
  fundPoolAmount: row.fundPoolAmount,
  loanBank: row.loanBank,
  partner: row.partner,
  orderType: row.orderType
}))

await batchAddFundFlow(batchData)
```

### 3. 数据库查询
```sql
-- 查询走款记录
SELECT 
  id, no, contract_no, order_no,
  fund_flow_amount, loan_amount, fund_pool_amount,
  loan_bank, plan_pay_time, status
FROM fund_flow 
WHERE deleted = 0 
ORDER BY create_time DESC;
```

## 注意事项

1. **字段一致性**：确保前端、后端、数据库的字段命名完全一致
2. **数据类型**：注意金额字段使用 `BigDecimal`，时间字段使用 `Date`
3. **验证逻辑**：保持金额计算的业务逻辑正确性
4. **索引优化**：根据查询需求合理设置数据库索引
5. **数据迁移**：如果已有数据，需要编写迁移脚本更新字段名

## 扩展建议

1. **枚举管理**：为走款状态、方向等字段创建枚举类
2. **审计日志**：记录走款操作的详细日志
3. **权限控制**：根据用户角色控制走款操作权限
4. **通知机制**：走款确认后发送通知
5. **报表统计**：提供走款数据的统计报表功能 