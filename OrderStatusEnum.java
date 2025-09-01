package com.example.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

/**
 * 订单状态枚举
 * 
 * @author system
 * @since 2024-01-01
 */
@Getter
public enum OrderStatusEnum {

    /**
     * 执行中
     */
    PROCESSING("processing", "执行中"),

    /**
     * 已结算
     */
    COMPLETED("completed", "已结算");

    /**
     * 枚举值
     */
    @EnumValue
    @JsonValue
    private final String value;

    /**
     * 枚举描述
     */
    private final String description;

    OrderStatusEnum(String value, String description) {
        this.value = value;
        this.description = description;
    }

    /**
     * 根据值获取枚举
     */
    public static OrderStatusEnum getByValue(String value) {
        for (OrderStatusEnum status : values()) {
            if (status.getValue().equals(value)) {
                return status;
            }
        }
        return null;
    }

    /**
     * 根据描述获取枚举
     */
    public static OrderStatusEnum getByDescription(String description) {
        for (OrderStatusEnum status : values()) {
            if (status.getDescription().equals(description)) {
                return status;
            }
        }
        return null;
    }
} 