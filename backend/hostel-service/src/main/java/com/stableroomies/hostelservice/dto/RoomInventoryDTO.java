package com.stableroomies.hostelservice.dto;

public class RoomInventoryDTO {
    private Integer individualRooms;
    private Integer twoSharingRooms;
    private Integer threeSharingRooms;
    private Integer fourSharingRooms;
    private Integer acRooms;
    private Integer nonAcRooms;

    public RoomInventoryDTO() {
    }

    public RoomInventoryDTO(Integer individualRooms, Integer twoSharingRooms, Integer threeSharingRooms, Integer fourSharingRooms, Integer acRooms, Integer nonAcRooms) {
        this.individualRooms = individualRooms;
        this.twoSharingRooms = twoSharingRooms;
        this.threeSharingRooms = threeSharingRooms;
        this.fourSharingRooms = fourSharingRooms;
        this.acRooms = acRooms;
        this.nonAcRooms = nonAcRooms;
    }

    public Integer getIndividualRooms() {
        return individualRooms != null ? individualRooms : 0;
    }

    public void setIndividualRooms(Integer individualRooms) {
        this.individualRooms = individualRooms;
    }

    public Integer getTwoSharingRooms() {
        return twoSharingRooms != null ? twoSharingRooms : 0;
    }

    public void setTwoSharingRooms(Integer twoSharingRooms) {
        this.twoSharingRooms = twoSharingRooms;
    }

    public Integer getThreeSharingRooms() {
        return threeSharingRooms != null ? threeSharingRooms : 0;
    }

    public void setThreeSharingRooms(Integer threeSharingRooms) {
        this.threeSharingRooms = threeSharingRooms;
    }

    public Integer getFourSharingRooms() {
        return fourSharingRooms != null ? fourSharingRooms : 0;
    }

    public void setFourSharingRooms(Integer fourSharingRooms) {
        this.fourSharingRooms = fourSharingRooms;
    }

    public Integer getAcRooms() {
        return acRooms != null ? acRooms : 0;
    }

    public void setAcRooms(Integer acRooms) {
        this.acRooms = acRooms;
    }

    public Integer getNonAcRooms() {
        return nonAcRooms != null ? nonAcRooms : 0;
    }

    public void setNonAcRooms(Integer nonAcRooms) {
        this.nonAcRooms = nonAcRooms;
    }

    public int calculateTotalRooms() {
        return getIndividualRooms() + getTwoSharingRooms() + getThreeSharingRooms() + getFourSharingRooms();
    }

    public int calculateTotalCapacity() {
        return (getIndividualRooms() * 1) + (getTwoSharingRooms() * 2) + (getThreeSharingRooms() * 3) + (getFourSharingRooms() * 4);
    }
}
