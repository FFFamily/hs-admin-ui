# 回收订单Java实体设计文档

## 概述

根据前端订单编辑页面的字段信息，设计了一套完整的Java实体类，包括主实体类和相关的枚举类，用于后端开发。

## 实体类设计

### 1. 主实体类 - RecycleOrder

**文件位置**: `RecycleOrder.java`

**主要特性**:
- 使用MyBatis-Plus注解进行ORM映射
- 使用Lombok简化代码
- 包含完整的字段验证注解
- 支持JSON序列化配置
- 包含审计字段（创建时间、更新时间、创建人、更新人）
- 支持逻辑删除

**核心字段**:

#### 基础信息字段
```java
private Long id;                    // 主键ID
private String no;                  // 订单编号
private String type;                // 订单类型
private String status;              // 订单状态
private LocalDateTime startTime;    // 起始时间
private LocalDateTime endTime;      // 结束时间
private String identifyCode;        // 订单识别码
```

#### 经办人信息字段
```java
private String processor;           // 经办人
private String processorPhone;      // 经办人电话
```

#### 金额相关字段
```java
private BigDecimal totalAmount;     // 订单总金额
private BigDecimal contractReferencePrice; // 合同参考价格
private BigDecimal contractPrice;   // 合同金额
```

#### 合同相关字段
```java
private String contractNo;          // 合同编号
private String contractName;        // 合同名称
private String contractPartner;     // 合同合作方
private String partyA;              // 甲方
private String partyB;              // 乙方
```

#### 地址相关字段
```java
private String warehouseAddress;    // 仓库地址
private String deliveryAddress;     // 交付地址
```

#### 业务字段
```java
private String flowDirection;       // 流转方向
private String paymentAccount;      // 走款账号
private String orderNodeImg;        // 订单图片
```

#### 审计字段
```java
private LocalDateTime createTime;   // 创建时间
private LocalDateTime updateTime;   // 更新时间
private String createBy;            // 创建人
private String updateBy;            // 更新人
private Integer deleted;            // 逻辑删除标识
private String remark;              // 备注
```

### 2. 枚举类设计

#### OrderTypeEnum - 订单类型枚举
**文件位置**: `OrderTypeEnum.java`

**枚举值**:
- `PURCHASE("purchase", "采购订单")`
- `TRANSPORT("transport", "运输订单")`
- `PROCESS("process", "加工订单")`
- `SALES("sales", "销售订单")`
- `STORAGE("storage", "仓储订单")`
- `OTHER("other", "其他订单")`

#### OrderStatusEnum - 订单状态枚举
**文件位置**: `OrderStatusEnum.java`

**枚举值**:
- `PROCESSING("processing", "执行中")`
- `COMPLETED("completed", "已结算")`

#### FlowDirectionEnum - 流转方向枚举
**文件位置**: `FlowDirectionEnum.java`

**枚举值**:
- `IN("入库", "入库")`
- `OUT("出库", "出库")`

#### ContractPartnerEnum - 合同合作方枚举
**文件位置**: `ContractPartnerEnum.java`

**枚举值**:
- `PARTY_A("甲方", "甲方")`
- `PARTY_B("乙方", "乙方")`

## 数据库设计

### 表结构 - recycle_order

**文件位置**: `recycle_order.sql`

**主要特性**:
- 使用InnoDB存储引擎
- UTF8MB4字符集
- 包含完整的字段注释
- 合理的索引设计
- 支持逻辑删除

**索引设计**:
```sql
PRIMARY KEY (`id`)                    -- 主键索引
UNIQUE KEY `uk_no` (`no`)             -- 订单编号唯一索引
KEY `idx_type` (`type`)               -- 订单类型索引
KEY `idx_status` (`status`)           -- 订单状态索引
KEY `idx_contract_no` (`contract_no`) -- 合同编号索引
KEY `idx_processor` (`processor`)     -- 经办人索引
KEY `idx_start_time` (`start_time`)   -- 起始时间索引
KEY `idx_create_time` (`create_time`) -- 创建时间索引
```

## 技术栈

### 1. 核心框架
- **MyBatis-Plus**: ORM框架，提供CRUD操作
- **Lombok**: 简化Java代码，自动生成getter/setter等方法
- **Jackson**: JSON序列化/反序列化

### 2. 验证框架
- **Hibernate Validator**: 字段验证
- **@NotBlank**: 字符串非空验证
- **@NotNull**: 对象非空验证
- **@DecimalMin**: 数值最小值验证

### 3. 注解说明

#### MyBatis-Plus注解
```java
@TableName("recycle_order")           // 表名映射
@TableId(value = "id", type = IdType.AUTO) // 主键配置
@TableField("field_name")             // 字段映射
@TableLogic                           // 逻辑删除
@TableField(fill = FieldFill.INSERT)  // 自动填充
```

#### Jackson注解
```java
@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") // 日期格式化
@JsonValue                             // 枚举序列化
```

#### 验证注解
```java
@NotBlank(message = "字段不能为空")     // 字符串非空验证
@NotNull(message = "字段不能为空")      // 对象非空验证
@DecimalMin(value = "0.01")           // 数值最小值验证
```

## 字段映射关系

### 前端字段 → Java字段 → 数据库字段

| 前端字段 | Java字段 | 数据库字段 | 类型 | 说明 |
|---------|----------|-----------|------|------|
| id | id | id | Long | 主键ID |
| no | no | no | String | 订单编号 |
| type | type | type | String | 订单类型 |
| status | status | status | String | 订单状态 |
| startTime | startTime | start_time | LocalDateTime | 起始时间 |
| endTime | endTime | end_time | LocalDateTime | 结束时间 |
| identifyCode | identifyCode | identify_code | String | 订单识别码 |
| processor | processor | processor | String | 经办人 |
| processorPhone | processorPhone | processor_phone | String | 经办人电话 |
| totalAmount | totalAmount | total_amount | BigDecimal | 订单总金额 |
| contractNo | contractNo | contract_no | String | 合同编号 |
| contractName | contractName | contract_name | String | 合同名称 |
| contractPartner | contractPartner | contract_partner | String | 合同合作方 |
| partyA | partyA | party_a | String | 甲方 |
| partyB | partyB | party_b | String | 乙方 |
| contractPrice | contractPrice | contract_price | BigDecimal | 合同金额 |
| warehouseAddress | warehouseAddress | warehouse_address | String | 仓库地址 |
| deliveryAddress | deliveryAddress | delivery_address | String | 交付地址 |
| flowDirection | flowDirection | flow_direction | String | 流转方向 |
| paymentAccount | paymentAccount | payment_account | String | 走款账号 |
| orderNodeImg | orderNodeImg | order_node_img | String | 订单图片 |

## 使用建议

### 1. 实体类使用
```java
// 创建订单
RecycleOrder order = new RecycleOrder()
    .setNo("ORD20240101001")
    .setType(OrderTypeEnum.PURCHASE.getValue())
    .setStatus(OrderStatusEnum.PROCESSING.getValue())
    .setStartTime(LocalDateTime.now())
    .setEndTime(LocalDateTime.now().plusDays(30))
    .setProcessor("张三")
    .setProcessorPhone("13800138000")
    .setTotalAmount(new BigDecimal("100000.00"));

// 保存订单
recycleOrderService.save(order);
```

### 2. 枚举使用
```java
// 获取订单类型描述
String typeDesc = OrderTypeEnum.getByValue("purchase").getDescription();

// 根据描述获取枚举
OrderTypeEnum type = OrderTypeEnum.getByDescription("采购订单");
```

### 3. 查询示例
```java
// 根据订单类型查询
List<RecycleOrder> orders = recycleOrderService.list(
    new LambdaQueryWrapper<RecycleOrder>()
        .eq(RecycleOrder::getType, OrderTypeEnum.PURCHASE.getValue())
        .eq(RecycleOrder::getStatus, OrderStatusEnum.PROCESSING.getValue())
);
```

## 扩展性考虑

### 1. 字段扩展
- 新增字段时，同时更新实体类、数据库表、前端页面
- 使用数据库迁移脚本管理表结构变更

### 2. 枚举扩展
- 新增枚举值时，同时更新前端常量文件和后端枚举类
- 保持前后端枚举值的一致性

### 3. 业务扩展
- 可以基于现有实体类扩展业务逻辑
- 支持添加自定义字段和业务方法

## 注意事项

1. **字段验证**: 确保所有必填字段都有相应的验证注解
2. **数据类型**: 金额字段使用BigDecimal，避免精度丢失
3. **时间格式**: 统一使用LocalDateTime，并配置JSON格式化
4. **索引优化**: 根据查询需求合理设计数据库索引
5. **逻辑删除**: 使用逻辑删除而非物理删除，保护数据安全
6. **审计字段**: 自动记录创建和更新信息，便于数据追踪

## 总结

这套Java实体设计完整覆盖了前端订单编辑页面的所有字段，具有良好的扩展性和维护性。通过合理的注解配置和数据库设计，可以高效地支持订单管理业务需求。 