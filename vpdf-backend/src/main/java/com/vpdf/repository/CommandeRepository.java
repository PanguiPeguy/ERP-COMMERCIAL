package com.vpdf.repository;

import com.vpdf.model.Commande;
import org.springframework.data.cassandra.repository.CassandraRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommandeRepository extends CassandraRepository<Commande, Integer> {
}