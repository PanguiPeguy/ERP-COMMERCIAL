package com.vpdf.service;

import com.vpdf.model.Article;
import com.vpdf.repository.ArticleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ArticleService {

    private final ArticleRepository articleRepository;

    public List<Article> findAll() {
        return articleRepository.findAll();
    }

    public Optional<Article> findById(Integer id) {
        return articleRepository.findById(id);
    }

    public Article save(Article article) {
        if (article.getDateCreation() == null) {
            article.setDateCreation(Instant.now());
        }
        if (article.getQuantiteEnStock() == null) {
            article.setQuantiteEnStock(0);
        }
        return articleRepository.save(article);
    }

    public Article updateStock(Integer id, int delta) {
        Article a = articleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Article " + id + " introuvable"));
        int newStock = a.getQuantiteEnStock() + delta;
        if (newStock < 0) {
            throw new RuntimeException("Stock insuffisant pour l\'article " + id
                + " (stock=" + a.getQuantiteEnStock() + ", demande=" + (-delta) + ")");
        }
        a.setQuantiteEnStock(newStock);
        return articleRepository.save(a);
    }

    public void delete(Integer id) {
        articleRepository.deleteById(id);
    }

    public long count() {
        return articleRepository.count();
    }
}