package com.vpdf.service;

import com.vpdf.dto.DashboardStats;
import com.vpdf.model.Commande;
import com.vpdf.model.LigneCommande;
import com.vpdf.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ClientRepository clientRepository;
    private final ArticleRepository articleRepository;
    private final CommandeRepository commandeRepository;
    private final LivraisonRepository livraisonRepository;
    private final LigneCommandeRepository ligneCommandeRepository;

    public DashboardStats getStats() {
        List<Commande> commandes = commandeRepository.findAll();
        List<LigneCommande> lignes = ligneCommandeRepository.findAll();

        BigDecimal ca = commandes.stream()
                .map(c -> c.getMontantTotal() != null ? c.getMontantTotal() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<DashboardStats.MonthlyRevenue> revenueParMois = buildMonthlyRevenue(commandes);
        List<DashboardStats.ArticleStats> topArticles = buildTopArticles(lignes);

        return DashboardStats.builder()
                .totalClients(clientRepository.count())
                .totalArticles(articleRepository.count())
                .totalCommandes(commandes.size())
                .totalLivraisons(livraisonRepository.count())
                .chiffreAffaires(ca)
                .revenueParMois(revenueParMois)
                .topArticles(topArticles)
                .build();
    }

    private List<DashboardStats.MonthlyRevenue> buildMonthlyRevenue(List<Commande> commandes) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM yyyy").withZone(ZoneId.systemDefault());
        Map<String, List<Commande>> byMonth = commandes.stream()
                .filter(c -> c.getDateCommande() != null)
                .collect(Collectors.groupingBy(c -> fmt.format(c.getDateCommande())));

        return byMonth.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> {
                    BigDecimal total = e.getValue().stream()
                            .map(c -> c.getMontantTotal() != null ? c.getMontantTotal() : BigDecimal.ZERO)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return DashboardStats.MonthlyRevenue.builder()
                            .mois(e.getKey())
                            .montant(total)
                            .nbCommandes((long) e.getValue().size())
                            .build();
                })
                .collect(Collectors.toList());
    }

    private List<DashboardStats.ArticleStats> buildTopArticles(List<LigneCommande> lignes) {
        Map<Integer, List<LigneCommande>> byArticle = lignes.stream()
                .collect(Collectors.groupingBy(l -> l.getId().getNoArticle()));

        return byArticle.entrySet().stream()
                .map(e -> {
                    long qte = e.getValue().stream()
                            .mapToLong(l -> l.getQuantite() != null ? l.getQuantite() : 0).sum();
                    BigDecimal ca = e.getValue().stream()
                            .map(l -> l.getSousTotal() != null ? l.getSousTotal() : BigDecimal.ZERO)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    String desc = e.getValue().get(0).getDescription();
                    return DashboardStats.ArticleStats.builder()
                            .noArticle(e.getKey())
                            .description(desc)
                            .quantiteVendue(qte)
                            .chiffreAffaires(ca)
                            .build();
                })
                .sorted((a, b) -> Long.compare(b.getQuantiteVendue(), a.getQuantiteVendue()))
                .limit(10)
                .collect(Collectors.toList());
    }
}