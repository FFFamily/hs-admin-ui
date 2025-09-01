package com.example.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

/**
 * 合同合作方枚举
 * 
 * @author system
 * @since 2024-01-01
 */
@Getter
public enum ContractPartnerEnum {

    /**
     * 甲方
     */
    PARTY_A("甲方", "甲方"),

    /**
     * 乙方
     */
    PARTY_B("乙方", "乙方");

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

    ContractPartnerEnum(String value, String description) {
        this.value = value;
        this.description = description;
    }

    /**
     * 根据值获取枚举
     */
    public static ContractPartnerEnum getByValue(String value) {
        for (ContractPartnerEnum partner : values()) {
            if (partner.getValue().equals(value)) {
                return partner;
            }
        }
        return null;
    }

    /**
     * 根据描述获取枚举
     */
    public static ContractPartnerEnum getByDescription(String description) {
        for (ContractPartnerEnum partner : values()) {
            if (partner.getDescription().equals(description)) {
                return partner;
            }
        }
        return null;
    }
} 