package com.example.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

/**
 * 流转方向枚举
 * 
 * @author system
 * @since 2024-01-01
 */
@Getter
public enum FlowDirectionEnum {

    /**
     * 入库
     */
    IN("入库", "入库"),

    /**
     * 出库
     */
    OUT("出库", "出库");

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

    FlowDirectionEnum(String value, String description) {
        this.value = value;
        this.description = description;
    }

    /**
     * 根据值获取枚举
     */
    public static FlowDirectionEnum getByValue(String value) {
        for (FlowDirectionEnum direction : values()) {
            if (direction.getValue().equals(value)) {
                return direction;
            }
        }
        return null;
    }

    /**
     * 根据描述获取枚举
     */
    public static FlowDirectionEnum getByDescription(String description) {
        for (FlowDirectionEnum direction : values()) {
            if (direction.getDescription().equals(description)) {
                return direction;
            }
        }
        return null;
    }
} 