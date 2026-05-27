package com.vpdf.model.key;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.cassandra.core.cql.PrimaryKeyType;
import org.springframework.data.cassandra.core.mapping.PrimaryKeyClass;
import org.springframework.data.cassandra.core.mapping.PrimaryKeyColumn;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
@PrimaryKeyClass
public class DetailLivraisonKey implements Serializable {

    @PrimaryKeyColumn(name = "no_livraison", ordinal = 0, type = PrimaryKeyType.PARTITIONED)
    private Integer noLivraison;

    @PrimaryKeyColumn(name = "no_commande", ordinal = 1, type = PrimaryKeyType.CLUSTERED)
    private Integer noCommande;

    @PrimaryKeyColumn(name = "no_article", ordinal = 2, type = PrimaryKeyType.CLUSTERED)
    private Integer noArticle;
}