package com.habitat.vibecode.service;

import com.habitat.vibecode.entity.Stock;
import com.habitat.vibecode.repository.StockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StockService {

    @Autowired
    private StockRepository stockRepository;

    public List<Long> getAllStockIds() {
        return stockRepository.findAllIds();
    }

    public Optional<Stock> getStockById(Long id) {
        return stockRepository.findById(id);
    }

    public Stock addStock(Stock stock) {
        return stockRepository.save(stock);
    }
}