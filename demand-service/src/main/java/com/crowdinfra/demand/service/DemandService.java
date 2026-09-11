package com.crowdinfra.demand.service;

import com.crowdinfra.demand.model.ClusterDto;
import com.crowdinfra.demand.model.Demand;
import com.crowdinfra.demand.repository.DemandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DemandService {

    private final DemandRepository demandRepository;
    private final FileStorageService fileStorageService;

    public Page<Demand> getDemands(Demand.Category category, Demand.Status status, Double lat, Double lng, Double radiusInMeters, Pageable pageable) {
        return demandRepository.findDemandsWithFilters(category, status, lat, lng, radiusInMeters, pageable);
    }

    public List<ClusterDto> getHeatmapClusters(double minLat, double maxLat, double minLng, double maxLng) {
        List<Demand> demands = demandRepository.findWithinBoundingBox(minLat, maxLat, minLng, maxLng);
        return demands.stream()
                .filter(d -> d.getLocation() != null)
                .map(d -> new ClusterDto(d.getLocation().getY(), d.getLocation().getX(), d.getUpvoteCount() + 1))
                .collect(Collectors.toList());
    }

    public Demand createDemand(Demand demand, List<MultipartFile> files, String userId) {
        demand.setUserId(userId);
        demand.setStatus(Demand.Status.PENDING);
        demand.setCreatedAt(LocalDateTime.now());
        demand.setUpdatedAt(LocalDateTime.now());
        
        List<String> imageUrls = new ArrayList<>();
        if (files != null) {
            for (MultipartFile file : files) {
                String url = fileStorageService.uploadFile(file);
                if (url != null) {
                    imageUrls.add(url);
                }
            }
        }
        demand.setImages(imageUrls);
        
        return demandRepository.save(demand);
    }

    public Demand updateDemand(String id, Demand updatedData, String userId, String userRole) {
        Demand existing = demandRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demand not found"));

        if (!existing.getUserId().equals(userId) && !"ADMIN".equals(userRole)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to update this demand");
        }

        existing.setTitle(updatedData.getTitle());
        existing.setDescription(updatedData.getDescription());
        existing.setCategory(updatedData.getCategory());
        existing.setLocation(updatedData.getLocation());
        existing.setAddress(updatedData.getAddress());
        existing.setUpdatedAt(LocalDateTime.now());
        
        return demandRepository.save(existing);
    }

    public void deleteDemand(String id, String userId, String userRole) {
        Demand existing = demandRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demand not found"));

        if (!existing.getUserId().equals(userId) && !"ADMIN".equals(userRole)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to delete this demand");
        }

        demandRepository.delete(existing);
    }

    public Demand updateStatus(String id, Demand.Status status, String userRole) {
        if (!"ADMIN".equals(userRole)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can update demand status");
        }

        Demand existing = demandRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demand not found"));

        existing.setStatus(status);
        existing.setUpdatedAt(LocalDateTime.now());
        return demandRepository.save(existing);
    }

    public Demand toggleUpvote(String id, String userId) {
        Demand existing = demandRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demand not found"));

        List<String> upvotedBy = existing.getUpvotedBy();
        if (upvotedBy == null) {
            upvotedBy = new ArrayList<>();
        }
        if (upvotedBy.contains(userId)) {
            upvotedBy.remove(userId);
            existing.setUpvoteCount(Math.max(0, existing.getUpvoteCount() - 1));
        } else {
            upvotedBy.add(userId);
            existing.setUpvoteCount(existing.getUpvoteCount() + 1);
        }
        existing.setUpvotedBy(upvotedBy);
        return demandRepository.save(existing);
    }
}
