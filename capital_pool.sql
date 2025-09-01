-- 资金池主表
CREATE TABLE `capital_pool` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `no` varchar(50) NOT NULL COMMENT '资金池编号',
  `contract_no` varchar(100) NOT NULL COMMENT '合同编号',
  `contract_name` varchar(200) NOT NULL COMMENT '合同名称',
  `partner` varchar(100) NOT NULL COMMENT '合作方',
  `contract_type` varchar(50) DEFAULT NULL COMMENT '合同类型',
  `fund_pool_direction` varchar(20) NOT NULL COMMENT '资金池方向（收款/付款）',
  `initial_amount` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT '初始金额',
  `balance` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT '当前余额',
  `initial_balance_voucher` text COMMENT '初始余额凭证',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态（0-禁用，1-启用）',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  `create_by` varchar(50) DEFAULT NULL COMMENT '创建人',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` varchar(50) DEFAULT NULL COMMENT '更新人',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '逻辑删除标志（0-未删除，1-已删除）',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_no` (`no`),
  KEY `idx_contract_no` (`contract_no`),
  KEY `idx_partner` (`partner`),
  KEY `idx_fund_pool_direction` (`fund_pool_direction`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='资金池主表';

-- 资金池明细表
CREATE TABLE `capital_pool_detail` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `capital_pool_id` bigint(20) NOT NULL COMMENT '资金池ID',
  `order_id` bigint(20) DEFAULT NULL COMMENT '订单ID',
  `order_no` varchar(50) DEFAULT NULL COMMENT '订单编号',
  `amount` decimal(15,2) NOT NULL COMMENT '订单金额',
  `direction` varchar(10) NOT NULL COMMENT '资金方向（+进，-出）',
  `before_balance` decimal(15,2) NOT NULL COMMENT '变更前余额',
  `after_balance` decimal(15,2) NOT NULL COMMENT '变更后余额',
  `transaction_type` tinyint(2) NOT NULL COMMENT '交易类型（1-订单收入，2-订单支出，3-手动调整，4-初始余额）',
  `transaction_desc` varchar(200) DEFAULT NULL COMMENT '交易描述',
  `voucher_no` varchar(50) DEFAULT NULL COMMENT '凭证号',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  `create_by` varchar(50) DEFAULT NULL COMMENT '创建人',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` varchar(50) DEFAULT NULL COMMENT '更新人',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '逻辑删除标志（0-未删除，1-已删除）',
  PRIMARY KEY (`id`),
  KEY `idx_capital_pool_id` (`capital_pool_id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_order_no` (`order_no`),
  KEY `idx_direction` (`direction`),
  KEY `idx_transaction_type` (`transaction_type`),
  KEY `idx_create_time` (`create_time`),
  CONSTRAINT `fk_capital_pool_detail_pool_id` FOREIGN KEY (`capital_pool_id`) REFERENCES `capital_pool` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='资金池明细表';

-- 插入初始数据示例
INSERT INTO `capital_pool` (`no`, `contract_no`, `contract_name`, `partner`, `contract_type`, `fund_pool_direction`, `initial_amount`, `balance`, `initial_balance_voucher`, `status`, `remark`, `create_by`) VALUES
('CP202401001', 'CT202401001', '设备租赁合同A', '合作伙伴A', '租赁合同', '收款', 100000.00, 100000.00, '银行转账凭证：20240101-001', 1, '设备租赁资金池', 'admin'),
('CP202401002', 'CT202401002', '设备采购合同B', '合作伙伴B', '采购合同', '付款', 50000.00, 50000.00, '银行转账凭证：20240101-002', 1, '设备采购资金池', 'admin');

-- 插入明细数据示例
INSERT INTO `capital_pool_detail` (`capital_pool_id`, `order_id`, `order_no`, `amount`, `direction`, `before_balance`, `after_balance`, `transaction_type`, `transaction_desc`, `voucher_no`, `remark`, `create_by`) VALUES
(1, NULL, NULL, 100000.00, '+', 0.00, 100000.00, 4, '初始余额', 'INIT-202401001', '资金池初始化', 'admin'),
(2, NULL, NULL, 50000.00, '-', 0.00, 50000.00, 4, '初始余额', 'INIT-202401002', '资金池初始化', 'admin'); 