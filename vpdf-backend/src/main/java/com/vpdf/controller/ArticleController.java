package com.vpdf.controller;

import com.vpdf.model.Article;
import com.vpdf.service.ArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
public class ArticleController {

    private final ArticleService articleService;

    @GetMapping
    public List<Article> getAll() {
        return articleService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Article> getById(@PathVariable Integer id) {
        return articleService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Article create(@RequestBody Article article) {
        return articleService.save(article);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Article> update(@PathVariable Integer id, @RequestBody Article article) {
        if (!articleService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        article.setNoArticle(id);
        return ResponseEntity.ok(articleService.save(article));
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<Article> updateStock(@PathVariable Integer id,
                                                @RequestBody Map<String, Integer> body) {
        try {
            int delta = body.getOrDefault("delta", 0);
            return ResponseEntity.ok(articleService.updateStock(id, delta));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        articleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}