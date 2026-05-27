package com.vpdf.repository;

import com.vpdf.model.Client;
import org.springframework.data.cassandra.repository.CassandraRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClientRepository extends CassandraRepository<Client, Integer> {
}