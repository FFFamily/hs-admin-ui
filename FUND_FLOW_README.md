# 走款管理模块设计文档

## 概述

基于Vue前端走款管理页面的分析，设计了完整的后端数据结构和数据库表结构。

## 文件说明

### 1. FundFlow.java
走款管理实体类，包含以下主要字段：

#### 基本信息字段
- `id`: 主键ID
- `no`: 走款编号（唯一）
- `contractNo`: 合同编号
- `contractName`: 合同名称
- `contractType`: 合同类型
- `contractStatus`: 合同状态
- `partner`: 合作方

#### 订单信息字段
- `orderId`: 订单ID
- `orderNo`: 订单编号
- `orderType`: 订单类型
- `orderStatus`: 订单状态
- `orderTotalAmount`: 订单总金额
- `orderShouldAmount`: 订单应走金额

#### 走款信息字段
- `contractFundPoolDirection`: 合同资金池方向
- `contractFundPoolBalance`: 合同资金池剩余金额
- `fundFlowDirection`: 走款方向
- `fundFlowAmount`: 走款金额
- `fundPoolDirection`: 资金池方向（+进/-出）
- `fundPoolAmount`: 资金池走款金额
- `loanDirection`: 贷款方向
- `loanAmount`: 贷款走款金额
- `loanBank`: 贷款走款银行
- `planPayTime`: 计划走款时间

#### 确认信息字段
- `processor`: 经办人
- `voucher`: 凭证
- `payFundTime`: 支付时间
- `status`: 走款状态（0-待确认，1-已确认，2-已取消）

#### 系统字段
- `createTime`: 创建时间
- `updateTime`: 更新时间
- `createBy`: 创建人
- `updateBy`: 更新人
- `deleted`: 逻辑删除标志

### 2. fund_flow.sql
数据库建表SQL，包含：

#### 表结构
- 完整的字段定义和注释
- 主键和唯一索引
- 常用查询字段的索引
- 默认值和约束

#### 示例数据
- 包含两条示例数据
- 展示了不同状态的走款记录

### 3. FundFlowStatusEnum.java
走款状态枚举类：
- `PENDING(0, "待确认")`: 待确认状态
- `CONFIRMED(1, "已确认")`: 已确认状态
- `CANCELLED(2, "已取消")`: 已取消状态

### 4. FundFlowDirectionEnum.java
走款方向枚举类：
- `IN("+", "进")`: 进款方向
- `OUT("-", "出")`: 出款方向

## 数据库设计特点

### 1. 索引设计
- 主键索引：`id`
- 唯一索引：`no`（走款编号）
- 普通索引：`contract_no`、`order_no`、`partner`、`status`、`create_time`、`pay_fund_time`

### 2. 字段类型选择
- 金额字段使用 `decimal(15,2)` 保证精度
- 时间字段使用 `datetime` 类型
- 状态字段使用 `tinyint` 节省空间
- 文本字段根据长度选择合适的 `varchar` 长度

### 3. 约束设计
- 必填字段：`no`、`contract_no`、`fund_flow_amount`、`fund_pool_direction`
- 默认值：`status` 默认为0（待确认），`deleted` 默认为0（未删除）
- 自动时间戳：`create_time`、`update_time`

## 使用建议

### 1. 实体类使用
```java
// 创建走款记录
FundFlow fundFlow = new FundFlow();
fundFlow.setNo("FF20240101001");
fundFlow.setContractNo("CT20240101001");
fundFlow.setFundFlowAmount(new BigDecimal("30000.00"));
fundFlow.setFundPoolDirection("+");
fundFlow.setStatus(FundFlowStatusEnum.PENDING.getCode());
```

### 2. 枚举使用
```java
// 获取状态描述
String statusDesc = FundFlowStatusEnum.getDescriptionByCode(1); // "已确认"

// 获取方向描述
String directionDesc = FundFlowDirectionEnum.getDescriptionByCode("+"); // "进"
```

### 3. 查询示例
```sql
-- 查询待确认的走款记录
SELECT * FROM fund_flow WHERE status = 0 AND deleted = 0;

-- 查询指定合同的走款记录
SELECT * FROM fund_flow WHERE contract_no = 'CT20240101001' AND deleted = 0;

-- 查询指定时间范围内的走款记录
SELECT * FROM fund_flow 
WHERE pay_fund_time BETWEEN '2024-01-01 00:00:00' AND '2024-01-31 23:59:59' 
AND deleted = 0;
```

## 扩展建议

1. **审计日志**: 可以添加走款操作的审计日志表
2. **审批流程**: 可以扩展审批状态和审批流程
3. **资金池关联**: 可以添加资金池表的关联关系
4. **文件附件**: 可以添加凭证文件的上传和存储
5. **通知机制**: 可以添加走款确认后的通知机制 