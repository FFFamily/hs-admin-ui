package com.example.enums;

/**
 * 资金池方向枚举
 * 
 * @author system
 * @since 2024-01-01
 */
public enum CapitalPoolDirectionEnum {

    /**
     * 收款
     */
    RECEIVE("收款", "RECEIVE"),

    /**
     * 付款
     */
    PAY("付款", "PAY");

    private final String label;
    private final String value;

    CapitalPoolDirectionEnum(String label, String value) {
        this.label = label;
        this.value = value;
    }

    public String getLabel() {
        return label;
    }

    public String getValue() {
        return value;
    }

    /**
     * 根据值获取枚举
     */
    public static CapitalPoolDirectionEnum getByValue(String value) {
        for (CapitalPoolDirectionEnum direction : values()) {
            if (direction.getValue().equals(value)) {
                return direction;
            }
        }
        return null;
    }

    /**
     * 根据标签获取枚举
     */
    public static CapitalPoolDirectionEnum getByLabel(String label) {
        for (CapitalPoolDirectionEnum direction : values()) {
            if (direction.getLabel().equals(label)) {
                return direction;
            }
        }
        return null;
    }
} 