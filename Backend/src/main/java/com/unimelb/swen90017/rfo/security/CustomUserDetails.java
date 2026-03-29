package com.unimelb.swen90017.rfo.security;

import com.unimelb.swen90017.rfo.pojo.constants.BaseConstants;
import com.unimelb.swen90017.rfo.pojo.po.UserPO;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

/**
 * Custom UserDetails implementation
 */
@Getter
public class CustomUserDetails implements UserDetails {

    private final UserPO user;

    public CustomUserDetails(UserPO user) {
        this.user = user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Convert role to authority - only ADMIN and MARKER are valid roles
        String role;
        if (user.getRole() == null) {
            throw new IllegalStateException("User role cannot be null");
        }

        if (user.getRole().equals(BaseConstants.USER_ROLE_ADMIN)) {
            role = "ROLE_ADMIN";
        } else if (user.getRole().equals(BaseConstants.USER_ROLE_MARKER)) {
            role = "ROLE_MARKER";
        } else {
            throw new IllegalStateException("Invalid user role: " + user.getRole());
        }

        return Collections.singletonList(new SimpleGrantedAuthority(role));
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        // Return email as username for authentication
        return user.getEmail();
    }

    @Override
    public boolean isEnabled() {
        // User is enabled if not deleted
        return user.getDeleteStatus() == null || user.getDeleteStatus().equals(BaseConstants.DELETE_STATUS_NOT_DELETED);
    }

    @Override
    public boolean isAccountNonExpired() {
        // Account expiration is not used in this system
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        // Account locking is not used in this system
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        // Credential expiration is not used in this system
        return true;
    }

    public Long getUserId() {
        return user.getId();
    }

    public Integer getRole() {
        return user.getRole();
    }
}