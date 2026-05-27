package com.vpdf.repository;

import com.vpdf.model.DetailLivraison;
import com.vpdf.model.key.DetailLivraisonKey;
import org.springframework.data.cassandra.repository.CassandraRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetailLivraisonRepository
        extends CassandraRepository<DetailLivraison, DetailLivraisonKey> {

    List<DetailLivraison> findByIdNoLivraison(Integer noLivraison);
}