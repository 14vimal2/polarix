package com.polarix.backend.specifications;

import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

public class FilterSpecification<T> implements Specification<T> {

    private final Map<String, String> filters;

    public FilterSpecification(Map<String, String> filters) {
        this.filters = filters;
    }

    @Override
    public Predicate toPredicate(Root<T> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
        List<Predicate> predicates = new ArrayList<>();

        for (Map.Entry<String, String> entry : filters.entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue();

            Predicate predicate = buildPredicate(root, cb, key, value);
            if (predicate != null) {
                predicates.add(predicate);
            }
        }

        return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(new Predicate[0]));
    }



    private Predicate buildPredicate(Root<T> root, CriteriaBuilder cb, String key, String value) {
        String[] parts = key.split("_", 2);
        if (parts.length != 2) return null; // Invalid format

        String field = parts[0];
        String operator = parts[1];

        Path<?> path;
        try {
            path = resolvePath(root, field);
        } catch (IllegalArgumentException e) {
            return null; // Invalid field path
        }

        switch (operator) {
            case "eq":
                return cb.equal(path, castValue(path, value));
            case "like":
                return cb.like(cb.lower(path.as(String.class)), "%" + value.toLowerCase() + "%");
            case "gte":
                return buildComparablePredicate(cb, path, value, ComparisonType.GTE);
            case "lte":
                return buildComparablePredicate(cb, path, value, ComparisonType.LTE);
            case "gt":
                return buildComparablePredicate(cb, path, value, ComparisonType.GT);
            case "lt":
                return buildComparablePredicate(cb, path, value, ComparisonType.LT);
            case "in":
                return buildInPredicate(cb, path, value);
            case "between":
                return buildBetweenPredicate(cb, path, value);
            default:
                return null; // Unknown operator
        }
    }

    private Path<?> resolvePath(Root<T> root, String field) {
        Path<?> path = root;
        for (String part : field.split("\\.")) {
            try {
                path = path.get(part);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid field path: " + field);
            }
        }
        return path;
    }

    private <Y extends Comparable<? super Y>> Predicate buildComparablePredicate(
            CriteriaBuilder cb, Path<?> path, String value, ComparisonType type) {
        Object rawValue = castValue(path, value);
        if (!(rawValue instanceof Comparable)) {
            return null;
        }

        Path<? extends Y> comparablePath = (Path<? extends Y>) path;
        Y comparableValue = (Y) rawValue;

        switch (type) {
            case GTE:
                return cb.greaterThanOrEqualTo(comparablePath, comparableValue);
            case LTE:
                return cb.lessThanOrEqualTo(comparablePath, comparableValue);
            case GT:
                return cb.greaterThan(comparablePath, comparableValue);
            case LT:
                return cb.lessThan(comparablePath, comparableValue);
            default:
                return null;
        }
    }

    private Predicate buildInPredicate(CriteriaBuilder cb, Path<?> path, String value) {
        List<Object> values = Arrays.stream(value.split(","))
                .map(v -> castValue(path, v.trim()))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        return values.isEmpty() ? null : path.in(values);
    }

    private Predicate buildBetweenPredicate(CriteriaBuilder cb, Path<?> path, String value) {
        String[] values = value.split(",");
        if (values.length != 2) {
            return null; // Between requires exactly two values
        }

        Object lowerBound = castValue(path, values[0].trim());
        Object upperBound = castValue(path, values[1].trim());

        if (!(lowerBound instanceof Comparable) || !(upperBound instanceof Comparable)) {
            return null;
        }

        Path<? extends Comparable> comparablePath = (Path<? extends Comparable>) path;
        return cb.between(comparablePath, (Comparable) lowerBound, (Comparable) upperBound);
    }

    private Object castValue(Path<?> path, String value) {
        Class<?> type = path.getJavaType();

        try {
            if (type.equals(Integer.class) || type.equals(int.class)) {
                return Integer.valueOf(value);
            } else if (type.equals(Long.class) || type.equals(long.class)) {
                return Long.valueOf(value);
            } else if (type.equals(Double.class) || type.equals(double.class)) {
                return Double.valueOf(value);
            } else if (type.equals(Float.class) || type.equals(float.class)) {
                return Float.valueOf(value);
            } else if (type.equals(Boolean.class) || type.equals(boolean.class)) {
                return Boolean.valueOf(value);
            } else if (type.equals(BigDecimal.class)) {
                return new BigDecimal(value);
            } else if (type.equals(LocalDate.class)) {
                return LocalDate.parse(value);
            } else if (type.equals(LocalDateTime.class)) {
                return LocalDateTime.parse(value);
            } else if (type.equals(UUID.class)) {
                return UUID.fromString(value);
            } else if (type.isEnum()) {
                return Enum.valueOf((Class<Enum>) type, value);
            }
        } catch (Exception e) {
            return null; // Invalid value for the type
        }

        return value; // Fallback to String
    }

    private enum ComparisonType {
        GTE, LTE, GT, LT
    }
}