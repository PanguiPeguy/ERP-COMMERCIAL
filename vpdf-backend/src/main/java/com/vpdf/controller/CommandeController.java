package com.vpdf.controller;

import com.vpdf.dto.CommandeDetail;
import com.vpdf.dto.CommandeRequest;
import com.vpdf.model.Commande;
import com.vpdf.service.CommandeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/commandes")
@RequiredArgsConstructor
public class CommandeController {

    private final CommandeService commandeService;

    @GetMapping
    public List<Commande> getAll() {
        return commandeService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommandeDetail> getById(@PathVariable Integer id) {
        return commandeService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/client/{clientId}")
    public List<Commande> getByClient(@PathVariable Integer clientId) {
        return commandeService.findByClient(clientId);
    }

    @PostMapping
    public ResponseEntity<CommandeDetail> create(@RequestBody CommandeRequest req) {
        try {
            return ResponseEntity.ok(commandeService.create(req));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PatchMapping("/{id}/statut")
    public ResponseEntity<Commande> updateStatut(@PathVariable Integer id,
                                                   @RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(commandeService.updateStatut(id, body.get("statut")));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        commandeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}