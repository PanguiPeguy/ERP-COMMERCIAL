package com.vpdf.model.key;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.cassandra.core.cql.Ordering;
import org.springframework.data.cassandra.core.cql.PrimaryKeyType;
import org.springframework.data.cassandra.core.mapping.PrimaryKeyClass;
import org.springframework.data.cassandra.core.mapping.PrimaryKeyColumn;

import java.io.Serializable;
import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
@PrimaryKeyClass
public class CommandeParClientKey implements Serializable {

    @PrimaryKeyColumn(name = "no_client", ordinal = 0, type = PrimaryKeyType.PARTITIONED)
    private Integer noClient;

    @PrimaryKeyColumn(name = "date_commande", ordinal = 1, type = PrimaryKeyType.CLUSTERED, ordering = Ordering.DESCENDING)
    private Instant dateCommande;

    @PrimaryKeyColumn(name = "no_commande", ordinal = 2, type = PrimaryKeyType.CLUSTERED)
    private Integer noCommande;
}