package com.vpdf.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.cassandra.core.mapping.Column;
import org.springframework.data.cassandra.core.mapping.PrimaryKey;
import org.springframework.data.cassandra.core.mapping.Table;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table("commandes")
public class Commande {

    @PrimaryKey("no_commande")
    private Integer noCommande;

    @Column("date_commande")
    private Instant dateCommande;

    @Column("no_client")
    private Integer noClient;

    @Column("nom_client")
    private String nomClient;

    @Column("statut")
    private String statut; // EN_ATTENTE | CONFIRMEE | LIVREE | ANNULEE

    @Column("montant_total")
    private BigDecimal montantTotal;
}