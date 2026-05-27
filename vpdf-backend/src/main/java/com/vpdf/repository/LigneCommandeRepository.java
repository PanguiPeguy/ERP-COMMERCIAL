package com.vpdf.repository;

import com.vpdf.model.LigneCommande;
import com.vpdf.model.key.LigneCommandeKey;
import org.springframework.data.cassandra.repository.CassandraRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LigneCommandeRepository
        extends CassandraRepository<LigneCommande, LigneCommandeKey> {

    List<LigneCommande> findByIdNoCommande(Integer noCommande);
}