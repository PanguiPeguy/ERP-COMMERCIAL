package com.vpdf.model;

import com.vpdf.model.key.CommandeParClientKey;
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
@Table("commandes_par_client")
public class CommandeParClient {

    @PrimaryKey
    private CommandeParClientKey id;

    @Column("statut")
    private String statut;

    @Column("montant_total")
    private BigDecimal montantTotal;
}