package com.vpdf.dto;

import lombok.Data;

import java.util.List;

@Data
public class CommandeRequest {
    private Integer noCommande;
    private Integer noClient;
    private List<LigneRequest> lignes;

    @Data
    public static class LigneRequest {
        private Integer noArticle;
        private Integer quantite;
    }
}