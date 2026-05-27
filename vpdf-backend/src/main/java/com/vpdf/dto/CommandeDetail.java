package com.vpdf.dto;

import com.vpdf.model.Commande;
import com.vpdf.model.LigneCommande;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CommandeDetail {
    private Commande commande;
    private List<LigneCommande> lignes;
}