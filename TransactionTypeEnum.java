package com.example.enums;

/**
 * 交易类型枚举
 * 
 * @author system
 * @since 2024-01-01
 */
public enum TransactionTypeEnum {

    /**
     * 订单收入
     */
    ORDER_INCOME(1, "订单收入"),

    /**
     * 订单支出
     */
    ORDER_EXPENSE(2, "订单支出"),

    /**
     * 手动调整
     */
    MANUAL_ADJUSTMENT(3, "手动调整"),

    /**
     * 初始余额
     */
    INITIAL_BALANCE(4, "初始余额");

    private final Integer code;
    private final String description;

    TransactionTypeEnum(Integer code, String description) {
        this.code = code;
        this.description = description;
    }

    public Integer getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    /**
     * 根据代码获取枚举
     */
    public static TransactionTypeEnum getByCode(Integer code) {
        for (TransactionTypeEnum type : values()) {
            if (type.getCode().equals(code)) {
                return type;
            }
        }
        return null;
    }

    /**
     * 根据描述获取枚举
     */
    public static TransactionTypeEnum getByDescription(String description) {
        for (TransactionTypeEnum type : values()) {
            if (type.getDescription().equals(description)) {
                return type;
            }
        }
        return null;
    }
} 