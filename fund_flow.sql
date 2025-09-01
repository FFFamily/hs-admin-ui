-- 走款管理表
CREATE TABLE `fund_flow` (
  `id` varchar(32) NOT NULL COMMENT '主键ID',
  `no` varchar(50) NOT NULL COMMENT '走款编号',
  `contract_no` varchar(50) NOT NULL COMMENT '合同编号',
  `contract_name` varchar(200) DEFAULT NULL COMMENT '合同名称',
  `contract_type` varchar(50) DEFAULT NULL COMMENT '合同类型',
  `contract_status` varchar(50) DEFAULT NULL COMMENT '合同状态',
  `partner` varchar(100) DEFAULT NULL COMMENT '合作方',
  `order_id` bigint(20) DEFAULT NULL COMMENT '订单ID',
  `order_no` varchar(50) DEFAULT NULL COMMENT '订单编号',
  `order_type` varchar(50) DEFAULT NULL COMMENT '订单类型',
  `order_status` varchar(50) DEFAULT NULL COMMENT '订单状态',
  `order_total_amount` decimal(15,2) DEFAULT NULL COMMENT '订单总金额',
  `order_should_amount` decimal(15,2) DEFAULT NULL COMMENT '订单应走金额',
  `contract_fund_pool_direction` varchar(10) DEFAULT NULL COMMENT '合同资金池方向',
  `contract_fund_pool_balance` decimal(15,2) DEFAULT NULL COMMENT '合同资金池剩余金额',
  `fund_flow_direction` varchar(10) DEFAULT NULL COMMENT '走款方向',
  `fund_flow_amount` decimal(15,2) NOT NULL COMMENT '走款金额',
  `fund_pool_direction` varchar(10) NOT NULL COMMENT '资金池方向（+进/-出）',
  `fund_pool_amount` decimal(15,2) DEFAULT NULL COMMENT '资金池走款金额',
  `loan_direction` varchar(10) DEFAULT NULL COMMENT '贷款方向',
  `loan_amount` decimal(15,2) DEFAULT NULL COMMENT '贷款走款金额',
  `loan_bank` varchar(100) DEFAULT NULL COMMENT '贷款走款银行',
  `plan_pay_time` datetime DEFAULT NULL COMMENT '计划走款时间',
  `processor` varchar(50) DEFAULT NULL COMMENT '经办人',
  `voucher` varchar(200) DEFAULT NULL COMMENT '凭证',
  `pay_fund_time` datetime DEFAULT NULL COMMENT '支付时间',
  `status` tinyint(4) DEFAULT '0' COMMENT '走款状态（0-待确认，1-已确认，2-已取消）',
  `remark` text COMMENT '备注',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` varchar(50) DEFAULT NULL COMMENT '创建人',
  `update_by` varchar(50) DEFAULT NULL COMMENT '更新人',
  `deleted` tinyint(4) DEFAULT '0' COMMENT '逻辑删除标志（0-未删除，1-已删除）',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_no` (`no`),
  KEY `idx_contract_no` (`contract_no`),
  KEY `idx_order_no` (`order_no`),
  KEY `idx_partner` (`partner`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`),
  KEY `idx_pay_fund_time` (`pay_fund_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='走款管理表';

-- 插入示例数据
INSERT INTO `fund_flow` (
  `no`, `contract_no`, `contract_name`, `contract_type`, `contract_status`, 
  `partner`, `order_no`, `order_type`, `order_status`, `order_total_amount`, 
  `order_should_amount`, `contract_fund_pool_direction`, `contract_fund_pool_balance`,
  `fund_flow_direction`, `fund_flow_amount`, `fund_pool_direction`, `fund_pool_amount`,
  `loan_direction`, `loan_amount`, `loan_bank`, `plan_pay_time`, `processor`,
  `voucher`, `pay_fund_time`, `status`, `remark`
) VALUES 
(
  'FF20240101001', 'CT20240101001', '回收合同A', '回收合同', '执行中',
  '合作方A', 'ORD20240101001', '回收订单', '待走款', 100000.00,
  80000.00, '+', 50000.00,
  '出', 30000.00, '-', 30000.00,
  '出', 20000.00, '工商银行', '2024-01-15 10:00:00', '张三',
  '凭证001', '2024-01-15 14:30:00', 1, '正常走款'
),
(
  'FF20240101002', 'CT20240101002', '回收合同B', '回收合同', '执行中',
  '合作方B', 'ORD20240101002', '回收订单', '待走款', 150000.00,
  120000.00, '+', 80000.00,
  '进', 50000.00, '+', 50000.00,
  '进', 30000.00, '建设银行', '2024-01-16 09:00:00', '李四',
  '凭证002', NULL, 0, '待确认走款'
); 