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
@Table("articles")
public class Article {

    @PrimaryKey("no_article")
    private Integer noArticle;

    @Column("description")
    private String description;

    @Column("prix_unitaire")
    private BigDecimal prixUnitaire;

    @Column("quantite_en_stock")
    private Integer quantiteEnStock;

    @Column("categorie")
    private String categorie;

    @Column("date_creation")
    private Instant dateCreation;
}