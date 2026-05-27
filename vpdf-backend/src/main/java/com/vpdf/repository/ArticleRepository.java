package com.vpdf.repository;

import com.vpdf.model.Article;
import org.springframework.data.cassandra.repository.CassandraRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ArticleRepository extends CassandraRepository<Article, Integer> {
}