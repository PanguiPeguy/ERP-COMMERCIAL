package com.vpdf.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class DashboardStats {
    private long totalClients;
    private long totalArticles;
    private long totalCommandes;
    private long totalLivraisons;
    private BigDecimal chiffreAffaires;
    private List<MonthlyRevenue> revenueParMois;
    private List<ArticleStats> topArticles;

    @Data
    @Builder
    public static class MonthlyRevenue {
        private String mois;
        private BigDecimal montant;
        private long nbCommandes;
    }

    @Data
    @Builder
    public static class ArticleStats {
        private Integer noArticle;
        private String description;
        private long quantiteVendue;
        private BigDecimal chiffreAffaires;
    }
}