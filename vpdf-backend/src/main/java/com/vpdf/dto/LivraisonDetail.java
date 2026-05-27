package com.vpdf.dto;

import com.vpdf.model.DetailLivraison;
import com.vpdf.model.Livraison;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class LivraisonDetail {
    private Livraison livraison;
    private List<DetailLivraison> details;
}