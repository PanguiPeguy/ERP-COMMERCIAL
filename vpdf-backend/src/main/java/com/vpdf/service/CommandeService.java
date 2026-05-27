package com.vpdf.service;

import com.vpdf.dto.CommandeDetail;
import com.vpdf.dto.CommandeRequest;
import com.vpdf.model.Client;
import com.vpdf.model.Commande;
import com.vpdf.model.CommandeParClient;
import com.vpdf.model.LigneCommande;
import com.vpdf.model.Article;
import com.vpdf.model.key.CommandeParClientKey;
import com.vpdf.model.key.LigneCommandeKey;
import com.vpdf.repository.ClientRepository;
import com.vpdf.repository.CommandeParClientRepository;
import com.vpdf.repository.CommandeRepository;
import com.vpdf.repository.LigneCommandeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CommandeService {

    private final CommandeRepository commandeRepository;
    private final CommandeParClientRepository commandeParClientRepository;
    private final LigneCommandeRepository ligneCommandeRepository;
    private final ClientRepository clientRepository;
    private final ArticleService articleService;

    public List<Commande> findAll() {
        return commandeRepository.findAll();
    }

    public Optional<CommandeDetail> findById(Integer id) {
        return commandeRepository.findById(id).map(commande -> {
            List<LigneCommande> lignes = ligneCommandeRepository.findByIdNoCommande(id);
            return CommandeDetail.builder()
                    .commande(commande)
                    .lignes(lignes)
                    .build();
        });
    }

    public List<Commande> findByClient(Integer noClient) {
        return commandeParClientRepository.findByIdNoClient(noClient)
                .stream()
                .map(cpc -> commandeRepository.findById(cpc.getId().getNoCommande())
                        .orElse(null))
                .filter(c -> c != null)
                .toList();
    }

    public CommandeDetail create(CommandeRequest req) {
        Instant now = Instant.now();

        // Récupérer le client
        Client client = clientRepository.findById(req.getNoClient())
                .orElseThrow(() -> new RuntimeException("Client introuvable: " + req.getNoClient()));

        // Calculer le montant total et créer les lignes
        BigDecimal total = BigDecimal.ZERO;
        List<LigneCommande> lignes = new ArrayList<>();

        for (CommandeRequest.LigneRequest lr : req.getLignes()) {
            Article article = articleService.findById(lr.getNoArticle())
                    .orElseThrow(() -> new RuntimeException("Article introuvable: " + lr.getNoArticle()));

            // Déduire du stock
            articleService.updateStock(lr.getNoArticle(), -lr.getQuantite());

            BigDecimal sousTotal = article.getPrixUnitaire()
                    .multiply(BigDecimal.valueOf(lr.getQuantite()));
            total = total.add(sousTotal);

            LigneCommande ligne = LigneCommande.builder()
                    .id(new LigneCommandeKey(req.getNoCommande(), lr.getNoArticle()))
                    .quantite(lr.getQuantite())
                    .description(article.getDescription())
                    .prixUnitaire(article.getPrixUnitaire())
                    .sousTotal(sousTotal)
                    .build();
            lignes.add(ligne);
        }

        // Créer la commande
        Commande commande = Commande.builder()
                .noCommande(req.getNoCommande())
                .dateCommande(now)
                .noClient(req.getNoClient())
                .nomClient(client.getNomClient())
                .statut("EN_ATTENTE")
                .montantTotal(total)
                .build();

        commandeRepository.save(commande);

        // Dénormaliser dans commandes_par_client
        CommandeParClient cpc = CommandeParClient.builder()
                .id(new CommandeParClientKey(req.getNoClient(), now, req.getNoCommande()))
                .statut("EN_ATTENTE")
                .montantTotal(total)
                .build();
        commandeParClientRepository.save(cpc);

        // Sauvegarder les lignes
        ligneCommandeRepository.saveAll(lignes);

        return CommandeDetail.builder()
                .commande(commande)
                .lignes(lignes)
                .build();
    }

    public Commande updateStatut(Integer id, String statut) {
        Commande c = commandeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Commande introuvable: " + id));
        c.setStatut(statut);
        return commandeRepository.save(c);
    }

    public void delete(Integer id) {
        ligneCommandeRepository.findByIdNoCommande(id)
                .forEach(l -> ligneCommandeRepository.delete(l));
        commandeRepository.deleteById(id);
    }

    public long count() {
        return commandeRepository.count();
    }
}