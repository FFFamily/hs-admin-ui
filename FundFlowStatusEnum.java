package com.example.enums;

/**
 * 走款状态枚举
 * 
 * @author system
 * @since 2024-01-01
 */
public enum FundFlowStatusEnum {
    
    /**
     * 待确认
     */
    PENDING(0, "待确认"),
    
    /**
     * 已确认
     */
    CONFIRMED(1, "已确认"),
    
    /**
     * 已取消
     */
    CANCELLED(2, "已取消");
    
    private final Integer code;
    private final String description;
    
    FundFlowStatusEnum(Integer code, String description) {
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
     * 根据code获取枚举
     */
    public static FundFlowStatusEnum getByCode(Integer code) {
        if (code == null) {
            return null;
        }
        for (FundFlowStatusEnum status : values()) {
            if (status.getCode().equals(code)) {
                return status;
            }
        }
        return null;
    }
    
    /**
     * 根据code获取描述
     */
    public static String getDescriptionByCode(Integer code) {
        FundFlowStatusEnum status = getByCode(code);
        return status != null ? status.getDescription() : "";
    }
} 