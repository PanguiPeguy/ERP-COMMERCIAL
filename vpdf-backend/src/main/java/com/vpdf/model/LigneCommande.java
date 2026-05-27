package com.vpdf.model;

import com.vpdf.model.key.LigneCommandeKey;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.cassandra.core.mapping.Column;
import org.springframework.data.cassandra.core.mapping.PrimaryKey;
import org.springframework.data.cassandra.core.mapping.Table;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table("lignes_commande")
public class LigneCommande {

    @PrimaryKey
    private LigneCommandeKey id;

    @Column("quantite")
    private Integer quantite;

    @Column("description")
    private String description;

    @Column("prix_unitaire")
    private BigDecimal prixUnitaire;

    @Column("sous_total")
    private BigDecimal sousTotal;
}