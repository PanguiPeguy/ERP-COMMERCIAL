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
@Table("clients")
public class Client {

    @PrimaryKey("no_client")
    private Integer noClient;

    @Column("nom_client")
    private String nomClient;

    @Column("no_telephone")
    private String noTelephone;

    @Column("date_creation")
    private Instant dateCreation;
}