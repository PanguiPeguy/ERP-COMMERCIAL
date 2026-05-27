package com.vpdf.dto;

import lombok.Data;

import java.util.List;

@Data
public class LivraisonRequest {
    private Integer noLivraison;
    private List<DetailRequest> details;

    @Data
    public static class DetailRequest {
        private Integer noCommande;
        private Integer noArticle;
        private Integer quantiteLivree;
    }
}