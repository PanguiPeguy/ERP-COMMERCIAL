package com.vpdf.model;

import com.vpdf.model.key.DetailLivraisonKey;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.cassandra.core.mapping.Column;
import org.springframework.data.cassandra.core.mapping.PrimaryKey;
import org.springframework.data.cassandra.core.mapping.Table;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table("details_livraison")
public class DetailLivraison {

    @PrimaryKey
    private DetailLivraisonKey id;

    @Column("quantite_livree")
    private Integer quantiteLivree;

    @Column("description")
    private String description;
}