package com.vpdf.repository;

import com.vpdf.model.CommandeParClient;
import com.vpdf.model.key.CommandeParClientKey;
import org.springframework.data.cassandra.repository.CassandraRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommandeParClientRepository
        extends CassandraRepository<CommandeParClient, CommandeParClientKey> {

    List<CommandeParClient> findByIdNoClient(Integer noClient);
}