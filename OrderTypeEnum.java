package com.example.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

/**
 * 订单类型枚举
 * 
 * @author system
 * @since 2024-01-01
 */
@Getter
public enum OrderTypeEnum {

    /**
     * 采购订单
     */
    PURCHASE("purchase", "采购订单"),

    /**
     * 运输订单
     */
    TRANSPORT("transport", "运输订单"),

    /**
     * 加工订单
     */
    PROCESS("process", "加工订单"),

    /**
     * 销售订单
     */
    SALES("sales", "销售订单"),

    /**
     * 仓储订单
     */
    STORAGE("storage", "仓储订单"),

    /**
     * 其他订单
     */
    OTHER("other", "其他订单");

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

    OrderTypeEnum(String value, String description) {
        this.value = value;
        this.description = description;
    }

    /**
     * 根据值获取枚举
     */
    public static OrderTypeEnum getByValue(String value) {
        for (OrderTypeEnum type : values()) {
            if (type.getValue().equals(value)) {
                return type;
            }
        }
        return null;
    }

    /**
     * 根据描述获取枚举
     */
    public static OrderTypeEnum getByDescription(String description) {
        for (OrderTypeEnum type : values()) {
            if (type.getDescription().equals(description)) {
                return type;
            }
        }
        return null;
    }
} 