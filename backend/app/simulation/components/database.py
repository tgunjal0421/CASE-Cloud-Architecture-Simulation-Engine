class PostgreSQL:
    latency = 30

    def process(self):
        return self.latency


class MySQL:
    latency = 35

    def process(self):
        return self.latency


class CacheLayer:
    latency = 5

    def process(self):
        return self.latency