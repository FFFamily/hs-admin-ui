package com.example.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 走款管理实体类
 * 
 * @author system
 * @since 2024-01-01
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("fund_flow")
public class FundFlow {

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.ASSIGN_ID)
    private String id;

    /**
     * 走款编号
     */
    @NotBlank(message = "走款编号不能为空")
    @TableField("no")
    private String no;

    /**
     * 合同编号
     */
    @NotBlank(message = "合同编号不能为空")
    @TableField("contract_no")
    private String contractNo;

    /**
     * 合同名称
     */
    @TableField("contract_name")
    private String contractName;

    /**
     * 合同类型
     */
    @TableField("contract_type")
    private String contractType;

    /**
     * 合同状态
     */
    @TableField("contract_status")
    private String contractStatus;

    /**
     * 合作方
     */
    @TableField("partner")
    private String partner;

    /**
     * 订单ID
     */
    @TableField("order_id")
    private Long orderId;

    /**
     * 订单编号
     */
    @TableField("order_no")
    private String orderNo;

    /**
     * 订单类型
     */
    @TableField("order_type")
    private String orderType;

    /**
     * 订单状态
     */
    @TableField("order_status")
    private String orderStatus;

    /**
     * 订单总金额
     */
    @TableField("order_total_amount")
    private BigDecimal orderTotalAmount;

    /**
     * 订单应走金额
     */
    @TableField("order_should_amount")
    private BigDecimal orderShouldAmount;

    /**
     * 合同资金池方向
     */
    @TableField("contract_fund_pool_direction")
    private String contractFundPoolDirection;

    /**
     * 合同资金池剩余金额
     */
    @TableField("contract_fund_pool_balance")
    private BigDecimal contractFundPoolBalance;

    /**
     * 走款方向
     */
    @TableField("fund_flow_direction")
    private String fundFlowDirection;

    /**
     * 走款金额
     */
    @NotNull(message = "走款金额不能为空")
    @TableField("fund_flow_amount")
    private BigDecimal fundFlowAmount;

    /**
     * 资金池方向（+进/-出）
     */
    @NotBlank(message = "资金池方向不能为空")
    @TableField("fund_pool_direction")
    private String fundPoolDirection;

    /**
     * 资金池走款金额
     */
    @TableField("fund_pool_amount")
    private BigDecimal fundPoolAmount;

    /**
     * 贷款方向
     */
    @TableField("loan_direction")
    private String loanDirection;

    /**
     * 贷款走款金额
     */
    @TableField("loan_amount")
    private BigDecimal loanAmount;

    /**
     * 贷款走款银行
     */
    @TableField("loan_bank")
    private String loanBank;

    /**
     * 计划走款时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @TableField("plan_pay_time")
    private Date planPayTime;

    /**
     * 经办人
     */
    @TableField("processor")
    private String processor;

    /**
     * 凭证
     */
    @TableField("voucher")
    private String voucher;

    /**
     * 支付时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @TableField("pay_fund_time")
    private Date payFundTime;

    /**
     * 走款状态（0-待确认，1-已确认，2-已取消）
     */
    @TableField("status")
    private Integer status;

    /**
     * 备注
     */
    @TableField("remark")
    private String remark;

    /**
     * 创建时间
     */
    @TableField(value = "create_time", fill = FieldFill.INSERT)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date createTime;

    /**
     * 更新时间
     */
    @TableField(value = "update_time", fill = FieldFill.INSERT_UPDATE)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date updateTime;

    /**
     * 创建人
     */
    @TableField(value = "create_by", fill = FieldFill.INSERT)
    private String createBy;

    /**
     * 更新人
     */
    @TableField(value = "update_by", fill = FieldFill.INSERT_UPDATE)
    private String updateBy;

    /**
     * 逻辑删除标志（0-未删除，1-已删除）
     */
    @TableLogic
    @TableField("deleted")
    private Integer deleted;
} 