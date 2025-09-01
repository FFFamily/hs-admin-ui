package com.example.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 资金池明细表
 * 
 * @author system
 * @since 2024-01-01
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("capital_pool_detail")
public class CapitalPoolDetail {

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 资金池ID
     */
    @TableField("capital_pool_id")
    private Long capitalPoolId;

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
     * 订单金额
     */
    @TableField("amount")
    private BigDecimal amount;

    /**
     * 资金方向（+进，-出）
     */
    @TableField("direction")
    private String direction;

    /**
     * 变更前余额
     */
    @TableField("before_balance")
    private BigDecimal beforeBalance;

    /**
     * 变更后余额
     */
    @TableField("after_balance")
    private BigDecimal afterBalance;

    /**
     * 交易类型（1-订单收入，2-订单支出，3-手动调整，4-初始余额）
     */
    @TableField("transaction_type")
    private Integer transactionType;

    /**
     * 交易描述
     */
    @TableField("transaction_desc")
    private String transactionDesc;

    /**
     * 凭证号
     */
    @TableField("voucher_no")
    private String voucherNo;

    /**
     * 备注
     */
    @TableField("remark")
    private String remark;

    /**
     * 创建人
     */
    @TableField(value = "create_by", fill = FieldFill.INSERT)
    private String createBy;

    /**
     * 创建时间
     */
    @TableField(value = "create_time", fill = FieldFill.INSERT)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTime;

    /**
     * 更新人
     */
    @TableField(value = "update_by", fill = FieldFill.INSERT_UPDATE)
    private String updateBy;

    /**
     * 更新时间
     */
    @TableField(value = "update_time", fill = FieldFill.INSERT_UPDATE)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updateTime;

    /**
     * 逻辑删除标志（0-未删除，1-已删除）
     */
    @TableLogic
    @TableField("deleted")
    private Integer deleted;
} 