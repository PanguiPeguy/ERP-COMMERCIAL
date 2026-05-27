package com.vpdf.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.cassandra.core.mapping.Column;
import org.springframework.data.cassandra.core.mapping.PrimaryKey;
import org.springframework.data.cassandra.core.mapping.Table;

import java.time.Instant;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table("livraisons")
public class Livraison {

    @PrimaryKey("no_livraison")
    private Integer noLivraison;

    @Column("date_livraison")
    private Instant dateLivraison;

    @Column("statut")
    private String statut; // PLANIFIEE | EN_COURS | LIVREE
}