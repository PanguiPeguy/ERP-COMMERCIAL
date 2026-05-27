package com.vpdf.repository;

import com.vpdf.model.Livraison;
import org.springframework.data.cassandra.repository.CassandraRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LivraisonRepository extends CassandraRepository<Livraison, Integer> {
}