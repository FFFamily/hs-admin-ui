package com.example.enums;

/**
 * 走款方向枚举
 * 
 * @author system
 * @since 2024-01-01
 */
public enum FundFlowDirectionEnum {
    
    /**
     * 进款
     */
    IN("+", "进"),
    
    /**
     * 出款
     */
    OUT("-", "出");
    
    private final String code;
    private final String description;
    
    FundFlowDirectionEnum(String code, String description) {
        this.code = code;
        this.description = description;
    }
    
    public String getCode() {
        return code;
    }
    
    public String getDescription() {
        return description;
    }
    
    /**
     * 根据code获取枚举
     */
    public static FundFlowDirectionEnum getByCode(String code) {
        if (code == null) {
            return null;
        }
        for (FundFlowDirectionEnum direction : values()) {
            if (direction.getCode().equals(code)) {
                return direction;
            }
        }
        return null;
    }
    
    /**
     * 根据code获取描述
     */
    public static String getDescriptionByCode(String code) {
        FundFlowDirectionEnum direction = getByCode(code);
        return direction != null ? direction.getDescription() : "";
    }
} 