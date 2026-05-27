package com.vpdf.service;

import com.vpdf.dto.LivraisonDetail;
import com.vpdf.dto.LivraisonRequest;
import com.vpdf.model.DetailLivraison;
import com.vpdf.model.LigneCommande;
import com.vpdf.model.Livraison;
import com.vpdf.model.key.DetailLivraisonKey;
import com.vpdf.repository.DetailLivraisonRepository;
import com.vpdf.repository.LigneCommandeRepository;
import com.vpdf.repository.LivraisonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LivraisonService {

    private final LivraisonRepository livraisonRepository;
    private final DetailLivraisonRepository detailRepository;
    private final LigneCommandeRepository ligneCommandeRepository;

    public List<Livraison> findAll() {
        return livraisonRepository.findAll();
    }

    public Optional<LivraisonDetail> findById(Integer id) {
        return livraisonRepository.findById(id).map(liv -> {
            List<DetailLivraison> details = detailRepository.findByIdNoLivraison(id);
            return LivraisonDetail.builder()
                    .livraison(liv)
                    .details(details)
                    .build();
        });
    }

    public LivraisonDetail create(LivraisonRequest req) {
        Livraison livraison = Livraison.builder()
                .noLivraison(req.getNoLivraison())
                .dateLivraison(Instant.now())
                .statut("PLANIFIEE")
                .build();
        livraisonRepository.save(livraison);

        List<DetailLivraison> details = new ArrayList<>();
        for (LivraisonRequest.DetailRequest dr : req.getDetails()) {
            // Récupérer la description de l\'article via la ligne de commande
            List<LigneCommande> lignes = ligneCommandeRepository
                    .findByIdNoCommande(dr.getNoCommande());
            String desc = lignes.stream()
                    .filter(l -> l.getId().getNoArticle().equals(dr.getNoArticle()))
                    .findFirst()
                    .map(LigneCommande::getDescription)
                    .orElse("Article " + dr.getNoArticle());

            DetailLivraison detail = DetailLivraison.builder()
                    .id(new DetailLivraisonKey(req.getNoLivraison(),
                            dr.getNoCommande(), dr.getNoArticle()))
                    .quantiteLivree(dr.getQuantiteLivree())
                    .description(desc)
                    .build();
            details.add(detail);
        }
        detailRepository.saveAll(details);

        return LivraisonDetail.builder()
                .livraison(livraison)
                .details(details)
                .build();
    }

    public Livraison updateStatut(Integer id, String statut) {
        Livraison l = livraisonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Livraison introuvable: " + id));
        l.setStatut(statut);
        return livraisonRepository.save(l);
    }

    public long count() {
        return livraisonRepository.count();
    }
}