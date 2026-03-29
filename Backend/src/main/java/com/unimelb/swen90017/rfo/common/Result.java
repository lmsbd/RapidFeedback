package com.unimelb.swen90017.rfo.common;

import lombok.Data;

/**
 * Unified response result class
 * @param <T> Data type
 */
@Data
public class Result<T> {
    
    /**
     * Response code
     */
    private Integer code;
    
    /**
     * Response message
     */
    private String message;
    
    /**
     * Response data
     */
    private T data;
    
    /**
     * Timestamp
     */
    private Long timestamp;
    
    public Result() {
        this.timestamp = System.currentTimeMillis();
    }
    
    public Result(Integer code, String message) {
        this();
        this.code = code;
        this.message = message;
    }
    
    public Result(Integer code, String message, T data) {
        this(code, message);
        this.data = data;
    }
    
    /**
     * Success response
     */
    public static <T> Result<T> success() {
        return new Result<>(200, "Operation successful");
    }
    
    /**
     * Success response with data
     */
    public static <T> Result<T> success(T data) {
        return new Result<>(200, "Operation successful", data);
    }
    
    /**
     * Success response with message and data
     */
    public static <T> Result<T> success(String message, T data) {
        return new Result<>(200, message, data);
    }
    
    /**
     * Error response
     */
    public static <T> Result<T> error() {
        return new Result<>(500, "Operation failed");
    }
    
    /**
     * Error response with message
     */
    public static <T> Result<T> error(String message) {
        return new Result<>(500, message);
    }
    
    /**
     * Error response with status code and message
     */
    public static <T> Result<T> error(Integer code, String message) {
        return new Result<>(code, message);
    }
    
    /**
     * Bad request response
     */
    public static <T> Result<T> badRequest(String message) {
        return new Result<>(400, message);
    }
    
    /**
     * Unauthorized response
     */
    public static <T> Result<T> unauthorized(String message) {
        return new Result<>(401, message);
    }
    
    /**
     * Forbidden response
     */
    public static <T> Result<T> forbidden(String message) {
        return new Result<>(403, message);
    }
    
    /**
     * Not found response
     */
    public static <T> Result<T> notFound(String message) {
        return new Result<>(404, message);
    }
}
