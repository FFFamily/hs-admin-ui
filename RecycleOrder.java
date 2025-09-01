package com.example.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.DecimalMin;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 回收订单实体类
 * 
 * @author system
 * @since 2024-01-01
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("recycle_order")
public class RecycleOrder implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 订单编号
     */
    @TableField("no")
    private String no;

    /**
     * 订单类型
     * @see com.example.enums.OrderTypeEnum
     */
    @NotBlank(message = "订单类型不能为空")
    @TableField("type")
    private String type;

    /**
     * 订单状态
     * @see com.example.enums.OrderStatusEnum
     */
    @NotBlank(message = "订单状态不能为空")
    @TableField("status")
    private String status;

    /**
     * 起始时间
     */
    @NotNull(message = "起始时间不能为空")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @TableField("start_time")
    private LocalDateTime startTime;

    /**
     * 结束时间
     */
    @NotNull(message = "结束时间不能为空")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @TableField("end_time")
    private LocalDateTime endTime;

    /**
     * 订单识别码
     */
    @TableField("identify_code")
    private String identifyCode;

    /**
     * 经办人
     */
    @NotBlank(message = "经办人不能为空")
    @TableField("processor")
    private String processor;

    /**
     * 经办人电话
     */
    @NotBlank(message = "经办人电话不能为空")
    @TableField("processor_phone")
    private String processorPhone;

    /**
     * 订单总金额
     */
    @NotNull(message = "订单总金额不能为空")
    @DecimalMin(value = "0.01", message = "订单总金额必须大于0")
    @TableField("total_amount")
    private BigDecimal totalAmount;

    /**
     * 订单节点时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @TableField("order_node_time")
    private LocalDateTime orderNodeTime;

    /**
     * 订单图片
     */
    @TableField("order_node_img")
    private String orderNodeImg;

    /**
     * 订单节点提货地点
     */
    @TableField("order_node_pickup_location")
    private String orderNodePickupLocation;

    /**
     * 订单节点交付地点
     */
    @TableField("order_node_delivery_location")
    private String orderNodeDeliveryLocation;

    /**
     * 合同编号
     */
    @NotBlank(message = "合同编号不能为空")
    @TableField("contract_no")
    private String contractNo;

    /**
     * 合同参考价格
     */
    @TableField("contract_reference_price")
    private BigDecimal contractReferencePrice;

    /**
     * 合同名称
     */
    @NotBlank(message = "合同名称不能为空")
    @TableField("contract_name")
    private String contractName;

    /**
     * 合同合作方
     * @see com.example.enums.ContractPartnerEnum
     */
    @TableField("contract_partner")
    private String contractPartner;

    /**
     * 甲方
     */
    @TableField("party_a")
    private String partyA;

    /**
     * 乙方
     */
    @TableField("party_b")
    private String partyB;

    /**
     * 合同金额
     */
    @TableField("contract_price")
    private BigDecimal contractPrice;

    /**
     * 仓库地址
     */
    @TableField("warehouse_address")
    private String warehouseAddress;

    /**
     * 交付地址
     */
    @TableField("delivery_address")
    private String deliveryAddress;

    /**
     * 流转方向
     * @see com.example.enums.FlowDirectionEnum
     */
    @TableField("flow_direction")
    private String flowDirection;

    /**
     * 走款账号
     */
    @TableField("payment_account")
    private String paymentAccount;

    /**
     * 创建时间
     */
    @TableField(value = "create_time", fill = FieldFill.INSERT)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    @TableField(value = "update_time", fill = FieldFill.INSERT_UPDATE)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updateTime;

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
     * 逻辑删除标识（0：未删除，1：已删除）
     */
    @TableLogic
    @TableField("deleted")
    private Integer deleted;

    /**
     * 备注
     */
    @TableField("remark")
    private String remark;
} 