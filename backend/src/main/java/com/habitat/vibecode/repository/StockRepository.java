package com.habitat.vibecode.repository;

import com.habitat.vibecode.entity.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {
    @Query("SELECT s.id FROM Stock s")
    List<Long> findAllIds();
}