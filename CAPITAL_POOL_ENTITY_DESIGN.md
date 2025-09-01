# 资金池管理系统实体设计文档

## 概述

基于Vue前端资金池管理页面的分析，设计了完整的资金池管理系统后端实体结构，包括主表和明细表，以及相关的枚举类。

## 实体设计

### 1. 资金池主表 (CapitalPool)

**表名**: `capital_pool`

**主要字段**:
- `id`: 主键ID
- `no`: 资金池编号（唯一）
- `contract_no`: 合同编号
- `contract_name`: 合同名称
- `partner`: 合作方
- `contract_type`: 合同类型
- `fund_pool_direction`: 资金池方向（收款/付款）
- `initial_amount`: 初始金额
- `balance`: 当前余额
- `initial_balance_voucher`: 初始余额凭证
- `status`: 状态（0-禁用，1-启用）

**业务特点**:
- 每个资金池关联一个合同
- 支持收款和付款两种方向
- 实时维护当前余额
- 支持状态管理

### 2. 资金池明细表 (CapitalPoolDetail)

**表名**: `capital_pool_detail`

**主要字段**:
- `id`: 主键ID
- `capital_pool_id`: 资金池ID（外键）
- `order_id`: 订单ID
- `order_no`: 订单编号
- `amount`: 订单金额
- `direction`: 资金方向（+进，-出）
- `before_balance`: 变更前余额
- `after_balance`: 变更后余额
- `transaction_type`: 交易类型
- `transaction_desc`: 交易描述
- `voucher_no`: 凭证号

**业务特点**:
- 记录资金池的所有资金变动
- 支持多种交易类型
- 维护余额变更前后的状态
- 提供完整的资金流水记录

## 枚举设计

### 1. 资金池方向枚举 (CapitalPoolDirectionEnum)

```java
- RECEIVE("收款", "RECEIVE")
- PAY("付款", "PAY")
```

### 2. 交易类型枚举 (TransactionTypeEnum)

```java
- ORDER_INCOME(1, "订单收入")
- ORDER_EXPENSE(2, "订单支出")
- MANUAL_ADJUSTMENT(3, "手动调整")
- INITIAL_BALANCE(4, "初始余额")
```

## 数据库设计特点

### 1. 索引设计
- 主键索引：`id`
- 唯一索引：`no`（资金池编号）
- 普通索引：合同编号、合作方、方向、状态等
- 外键索引：资金池明细表关联主表

### 2. 约束设计
- 主键约束
- 唯一约束（资金池编号）
- 外键约束（明细表关联主表）
- 非空约束（关键业务字段）

### 3. 字段类型选择
- 金额字段使用 `DECIMAL(15,2)` 保证精度
- 时间字段使用 `DATETIME` 类型
- 状态字段使用 `TINYINT` 类型
- 文本字段根据长度选择 `VARCHAR` 或 `TEXT`

## 业务逻辑

### 1. 资金池创建
- 生成唯一编号
- 设置初始金额和余额
- 创建初始余额明细记录

### 2. 资金变动
- 根据交易类型确定资金方向
- 计算变更前后余额
- 创建明细记录
- 更新主表余额

### 3. 余额计算
- 收款方向：余额增加
- 付款方向：余额减少
- 实时维护当前余额

## 扩展性考虑

### 1. 支持多种合同类型
- 租赁合同
- 采购合同
- 销售合同
- 其他业务合同

### 2. 支持多种交易类型
- 订单相关交易
- 手动调整
- 系统自动处理

### 3. 支持审计功能
- 完整的操作记录
- 创建人和更新人追踪
- 时间戳记录

## 使用示例

### 1. 创建资金池
```java
CapitalPool pool = new CapitalPool();
pool.setNo("CP202401001");
pool.setContractNo("CT202401001");
pool.setFundPoolDirection("收款");
pool.setInitialAmount(new BigDecimal("100000.00"));
pool.setBalance(new BigDecimal("100000.00"));
```

### 2. 记录资金变动
```java
CapitalPoolDetail detail = new CapitalPoolDetail();
detail.setCapitalPoolId(poolId);
detail.setAmount(amount);
detail.setDirection("+");
detail.setTransactionType(TransactionTypeEnum.ORDER_INCOME.getCode());
```

## 总结

该设计完整覆盖了资金池管理的核心业务需求，提供了灵活的扩展性，支持复杂的资金流转场景，同时保证了数据的完整性和一致性。 