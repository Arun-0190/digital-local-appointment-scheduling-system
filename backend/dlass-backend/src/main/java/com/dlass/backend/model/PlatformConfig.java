package com.dlass.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "platform_config")
public class PlatformConfig {

    @Id
    private String id;
    private int cancellationMinutes;
    private int slotLockMinutes;

    public PlatformConfig() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public int getCancellationMinutes() { return cancellationMinutes; }
    public void setCancellationMinutes(int cancellationMinutes) { this.cancellationMinutes = cancellationMinutes; }

    public int getSlotLockMinutes() { return slotLockMinutes; }
    public void setSlotLockMinutes(int slotLockMinutes) { this.slotLockMinutes = slotLockMinutes; }
}
