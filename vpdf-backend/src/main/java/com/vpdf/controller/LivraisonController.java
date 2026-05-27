package com.vpdf.controller;

import com.vpdf.dto.LivraisonDetail;
import com.vpdf.dto.LivraisonRequest;
import com.vpdf.model.Livraison;
import com.vpdf.service.LivraisonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/livraisons")
@RequiredArgsConstructor
public class LivraisonController {

    private final LivraisonService livraisonService;

    @GetMapping
    public List<Livraison> getAll() {
        return livraisonService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<LivraisonDetail> getById(@PathVariable Integer id) {
        return livraisonService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<LivraisonDetail> create(@RequestBody LivraisonRequest req) {
        try {
            return ResponseEntity.ok(livraisonService.create(req));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PatchMapping("/{id}/statut")
    public ResponseEntity<Livraison> updateStatut(@PathVariable Integer id,
                                                    @RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(livraisonService.updateStatut(id, body.get("statut")));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}