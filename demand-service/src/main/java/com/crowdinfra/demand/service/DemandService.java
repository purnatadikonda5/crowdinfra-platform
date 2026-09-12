package com.crowdinfra.demand.service;

import com.crowdinfra.demand.model.Demand;
import com.crowdinfra.demand.repository.DemandRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
public class DemandService {

    private final DemandRepository demandRepository;
    private final GeminiService geminiService;

    public DemandService(DemandRepository demandRepository, GeminiService geminiService) {
        this.demandRepository = demandRepository;
        this.geminiService = geminiService;
    }

    public List<Demand> getAllDemands() {
        return demandRepository.findAll();
    }

    public Optional<Demand> getDemandById(String id) {
        return demandRepository.findById(id).map(demand -> {
            demand.setViewCount(demand.getViewCount() + 1);
            return demandRepository.save(demand);
        });
    }

    public List<Demand> getDemandsByUserId(String userId) {
        return demandRepository.findByUserId(userId);
    }

    public Demand createDemand(Demand demand, String userId) {
        demand.setUserId(userId);
        demand.setStatus("PENDING");
        demand.setUpvoteCount(0);
        demand.setUpvotedBy(new ArrayList<>());
        demand.setCommentCount(0);
        demand.setViewCount(0);
        demand.setCreatedAt(LocalDateTime.now());
        demand.setUpdatedAt(LocalDateTime.now());
        
        log.info("Creating demand for user {}", userId);
        return demandRepository.save(demand);
    }

    public Demand updateDemand(String id, Demand updatedDemand, String userId) {
        return demandRepository.findById(id).map(demand -> {
            if (!demand.getUserId().equals(userId)) {
                throw new RuntimeException("Unauthorized");
            }
            if (updatedDemand.getTitle() != null) demand.setTitle(updatedDemand.getTitle());
            if (updatedDemand.getDescription() != null) demand.setDescription(updatedDemand.getDescription());
            if (updatedDemand.getCategory() != null) demand.setCategory(updatedDemand.getCategory());
            if (updatedDemand.getLocation() != null) demand.setLocation(updatedDemand.getLocation());
            
            demand.setUpdatedAt(LocalDateTime.now());
            return demandRepository.save(demand);
        }).orElseThrow(() -> new RuntimeException("Demand not found"));
    }

    public void deleteDemand(String id, String userId, String userRole) {
        Demand demand = demandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demand not found"));
                
        if (!demand.getUserId().equals(userId) && !"ADMIN".equals(userRole)) {
            throw new RuntimeException("Unauthorized");
        }
        
        demandRepository.delete(demand);
        log.info("Deleted demand {}", id);
    }

    public Demand toggleVote(String id, String userId) {
        return demandRepository.findById(id).map(demand -> {
            List<String> voters = demand.getUpvotedBy();
            if (voters == null) {
                voters = new ArrayList<>();
            }
            
            if (voters.contains(userId)) {
                voters.remove(userId);
                demand.setUpvoteCount(Math.max(0, demand.getUpvoteCount() - 1));
            } else {
                voters.add(userId);
                demand.setUpvoteCount(demand.getUpvoteCount() + 1);
            }
            demand.setUpvotedBy(voters);
            return demandRepository.save(demand);
        }).orElseThrow(() -> new RuntimeException("Demand not found"));
    }

    public String getAnalysis(String id) {
        Demand demand = demandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demand not found"));
        return geminiService.analyze(demand);
    }

    public String refreshAnalysis(String id) {
        Demand demand = demandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demand not found"));
        return geminiService.refreshAnalysis(demand);
    }

    public Demand updateStatus(String id, String status) {
        return demandRepository.findById(id).map(demand -> {
            demand.setStatus(status);
            demand.setUpdatedAt(LocalDateTime.now());
            return demandRepository.save(demand);
        }).orElseThrow(() -> new RuntimeException("Demand not found"));
    }
}
